let exam = null;
let currentIndex = 0;
let answers = {};
let timerInterval = null;
let submitted = false;

document.addEventListener("DOMContentLoaded", function () {
    initPage("Attempt Exam");

    const params = new URLSearchParams(window.location.search);
    const examId = params.get("id");

    if (!examId) {
        alert("Exam not found.");
        window.location.href = "exams.html";
        return;
    }

    document.getElementById("unlockBtn").addEventListener("click", async function () {
        const key = document.getElementById("enrollmentKey").value.trim();

        if (!key) {
            alert("Please enter enrollment key.");
            return;
        }

        try {
            showSpinner();

            exam = await getExamForAttempt(examId, key);

            document.getElementById("keySection").style.display = "none";
            document.getElementById("examTitle").textContent = exam.subject || "Attempt Exam";
            document.getElementById("examInfo").textContent =
                "Exam started. Submit before the timer ends.";

            startTimer(Number(exam.duration || 1));

            if (exam.examType === "PDF") {
                document.getElementById("pdfSection").style.display = "block";

                const pdfLink = document.getElementById("pdfLink");

                pdfLink.href = "#";
                pdfLink.textContent = "Open " + exam.pdfFileName;

                pdfLink.addEventListener("click", function (e) {
                    e.preventDefault();

                    if (submitted) {
                        alert("Exam time has ended.");
                        return;
                    }

                    const pdfWindow = window.open();

                    pdfWindow.document.write(`
      <html>
      <head>
        <title>${exam.subject}</title>

        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }

          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>

      <body>
        <iframe src="${exam.pdfBase64}"></iframe>

        <script>
          window.addEventListener('message', function(event) {
            if (event.data === 'FORCE_CLOSE_EXAM') {
              window.close();
            }
          });
        <\/script>
      </body>
      </html>
    `);

                    window.currentPdfWindow = pdfWindow;
                });
            }
            if (exam.examType === "POLL") {
                document.getElementById("pollSection").style.display = "block";
                currentIndex = 0;
                answers = {};
                showQuestion();
            }

        } catch (error) {
            console.error(error);
            alert(
                "Exam cannot be unlocked.\n\n" +
                "Check enrollment key or exam start time."
            );
        } finally {
            hideSpinner();
        }
    });

    document.getElementById("nextBtn").addEventListener("click", function () {
        if (!saveAnswer()) return;

        if (currentIndex < exam.questions.length - 1) {
            currentIndex++;
            showQuestion();
        }

        if (currentIndex === exam.questions.length - 1) {
            document.getElementById("nextBtn").style.display = "none";
            document.getElementById("submitBtn").style.display = "inline-flex";
        }
    });

    document.getElementById("submitBtn").addEventListener("click", function () {
        submitPoll(false);
    });

    document.getElementById("finishPdfBtn").addEventListener("click", async function () {
        await submitPdfAndFinish();
    });
});

function startTimer(durationHours) {
    const timerBox = document.getElementById("timerBox");
    const timerText = document.getElementById("timerText");

    timerBox.style.display = "block";

    let secondsLeft = durationHours * 60 * 60;

    timerInterval = setInterval(function () {
        const hours = Math.floor(secondsLeft / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;

        timerText.textContent =
            String(hours).padStart(2, "0") + ":" +
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0");

        if (secondsLeft <= 0) {
            clearInterval(timerInterval);

            submitted = true;

            if (window.currentPdfWindow && !window.currentPdfWindow.closed) {
                window.currentPdfWindow.postMessage("FORCE_CLOSE_EXAM", "*");

                setTimeout(() => {
                    try {
                        window.currentPdfWindow.close();
                    } catch (e) {}
                }, 500);
            }

            alert("Time is over. Exam has ended.");

            if (exam.examType === "POLL") {
                submitPoll(true);
            } else {
                window.location.href = "exams.html";
            }
        }

        secondsLeft--;
    }, 1000);
}

function showQuestion() {
    const q = exam.questions[currentIndex];

    document.getElementById("questionBox").innerHTML = `
    <div class="question-header">
      <span>Question ${currentIndex + 1} of ${exam.questions.length}</span>
    </div>

    <h3>${q.questionText}</h3>

    <label class="option">
      <input type="radio" name="answer" value="A">
      <span>${q.optionA}</span>
    </label>

    <label class="option">
      <input type="radio" name="answer" value="B">
      <span>${q.optionB}</span>
    </label>

    <label class="option">
      <input type="radio" name="answer" value="C">
      <span>${q.optionC}</span>
    </label>

    <label class="option">
      <input type="radio" name="answer" value="D">
      <span>${q.optionD}</span>
    </label>
  `;

    if (answers[q.id]) {
        const selected = document.querySelector(
            `input[name="answer"][value="${answers[q.id]}"]`
        );

        if (selected) {
            selected.checked = true;
        }
    }
}

function saveAnswer() {
    const q = exam.questions[currentIndex];
    const selected = document.querySelector('input[name="answer"]:checked');

    if (!selected) {
        alert("Please select an answer.");
        return false;
    }

    answers[q.id] = selected.value;
    return true;
}

async function submitPoll(autoSubmit) {
    if (submitted) return;

    if (!autoSubmit) {
        if (!saveAnswer()) return;
    } else {
        const selected = document.querySelector('input[name="answer"]:checked');
        if (selected && exam && exam.questions && exam.questions[currentIndex]) {
            answers[exam.questions[currentIndex].id] = selected.value;
        }
    }

    submitted = true;
    clearInterval(timerInterval);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const examId = new URLSearchParams(window.location.search).get("id");

    const payload = {
        studentName: user.name || "Student",
        studentId: String(user.id || user.email || "STUDENT"),
        enrollmentKey: document.getElementById("enrollmentKey").value.trim(),
        answers: answers
    };

    try {
        showSpinner();

        const result = await submitPollExam(examId, payload);

        alert(
            "Exam submitted successfully!\n\n" +
            "Marks: " + Number(result.marks).toFixed(2) + "%\n" +
            "Grade: " + result.grade
        );

        window.location.href = "results.html";

    } catch (error) {
        console.error(error);
        alert("Failed to submit exam.");
        submitted = false;
    } finally {
        hideSpinner();
    }
}

async function submitPdfAndFinish() {
        if (submitted) return;

        submitted = true;
        clearInterval(timerInterval);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const examId = new URLSearchParams(window.location.search).get("id");

        const payload = {
            studentName: user.name || "Student",
            studentId: String(user.id || user.email || "STUDENT"),
            enrollmentKey: document.getElementById("enrollmentKey").value.trim(),
            answers: {}
        };

        try {
            showSpinner();

            await submitPdfExam(examId, payload);

            alert("PDF exam finished.");
            window.location.href = "exams.html";

        } catch (error) {
            console.error(error);
            alert("Failed to finish exam.");
            submitted = false;
        } finally {
            hideSpinner();
        }
    }
