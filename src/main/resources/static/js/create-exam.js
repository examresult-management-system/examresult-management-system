document.addEventListener("DOMContentLoaded", function () {
    initPage("Create Exam");
    loadExamFaculties();

    const examType = document.getElementById("examType");
    const pdfSection = document.getElementById("pdfSection");
    const pollSection = document.getElementById("pollSection");
    const questionsContainer = document.getElementById("questionsContainer");

    examType.addEventListener("change", function () {
        pdfSection.style.display = examType.value === "PDF" ? "block" : "none";
        pollSection.style.display = examType.value === "POLL" ? "block" : "none";

        if (examType.value !== "PDF") {
            document.getElementById("pdfFile").value = "";
        }

        if (examType.value !== "POLL") {
            questionsContainer.innerHTML = "";
            document.getElementById("questionCount").value = "";
        }
    });

    document.getElementById("generateQuestionsBtn").addEventListener("click", function () {
        const count = Number(document.getElementById("questionCount").value);

        if (!count || count < 1) {
            alert("Please enter valid question count.");
            return;
        }

        questionsContainer.innerHTML = "";

        for (let i = 1; i <= count; i++) {
            questionsContainer.innerHTML += `
        <div class="question-box">
          <h4>Question ${i}</h4>

          <div class="form-group">
            <label>Question</label>
            <textarea class="form-control questionText" rows="3" required></textarea>
          </div>

          <div class="answer-grid">
            <div class="form-group">
              <label>Answer A</label>
              <input type="text" class="form-control optionA" required>
            </div>

            <div class="form-group">
              <label>Answer B</label>
              <input type="text" class="form-control optionB" required>
            </div>

            <div class="form-group">
              <label>Answer C</label>
              <input type="text" class="form-control optionC" required>
            </div>

            <div class="form-group">
              <label>Answer D</label>
              <input type="text" class="form-control optionD" required>
            </div>
          </div>

          <div class="form-group">
            <label>Correct Answer</label>
            <select class="form-control correctAnswer" required>
              <option value="">Select Correct Answer</option>
              <option value="A">Answer A</option>
              <option value="B">Answer B</option>
              <option value="C">Answer C</option>
              <option value="D">Answer D</option>
            </select>
          </div>
        </div>
      `;
        }
    });

    document.getElementById("createExamForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const subject = document.getElementById("subject").value.trim();
        const moduleCode = document.getElementById("moduleCode").value.trim();
        const faculty = document.getElementById("faculty").value;
        const type = document.getElementById("examType").value;
        const enrollmentKey = document.getElementById("enrollmentKey").value.trim();

        const examDateInput = document.getElementById("examDate");
        const examTimeInput = document.getElementById("examTime");

        const examDate = examDateInput.value;
        const examTime = examTimeInput.value;
        const duration = Number(document.getElementById("duration").value);

        console.log("EXAM DATE SENT:", examDate);
        console.log("EXAM TIME SENT:", examTime);

        if (!subject || !moduleCode || !faculty || !type || !enrollmentKey || !examDate || !examTime || !duration) {
            alert("Please fill all required fields.");
            return;
        }

        let pdfBase64 = "";
        let pdfFileName = "";

        if (type === "PDF") {
            const file = document.getElementById("pdfFile").files[0];

            if (!file) {
                alert("Please upload a PDF file.");
                return;
            }

            if (file.type !== "application/pdf") {
                alert("Only PDF files are allowed.");
                return;
            }

            pdfFileName = file.name;
            pdfBase64 = await fileToBase64(file);
        }

        const questions = [];

        if (type === "POLL") {
            const boxes = document.querySelectorAll(".question-box");

            if (boxes.length === 0) {
                alert("Please generate questions.");
                return;
            }

            for (const box of boxes) {
                const questionText = box.querySelector(".questionText").value.trim();
                const optionA = box.querySelector(".optionA").value.trim();
                const optionB = box.querySelector(".optionB").value.trim();
                const optionC = box.querySelector(".optionC").value.trim();
                const optionD = box.querySelector(".optionD").value.trim();
                const correctAnswer = box.querySelector(".correctAnswer").value;

                if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
                    alert("Please complete all poll questions.");
                    return;
                }

                questions.push({
                    questionText: questionText,
                    optionA: optionA,
                    optionB: optionB,
                    optionC: optionC,
                    optionD: optionD,
                    correctAnswer: correctAnswer
                });
            }
        }

        const payload = {
            subject: subject,
            moduleCode: moduleCode,
            lecturer: user.name || "Lecturer",
            hall: "-",
            faculty: faculty,
            examType: type,
            enrollmentKey: enrollmentKey,
            examDate: examDate,
            examTime: examTime,
            duration: duration,
            pdfFileName: pdfFileName,
            pdfBase64: pdfBase64,
            questions: questions
        };

        console.log("PAYLOAD SENT:", payload);

        try {
            showSpinner();

            const data = await createAdvancedExam(payload);

            alert("Exam created successfully!");
            window.location.href = "lecturer-dashboard.html";

        } catch (error) {
            console.error(error);
            alert("Failed to create exam.");
        } finally {
            hideSpinner();
        }
    });
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}
async function loadExamFaculties() {
    const facultySelect = document.getElementById("faculty");
    if (!facultySelect) return;

    facultySelect.innerHTML = '<option value="">Loading faculties...</option>';

    try {
        const faculties = await getFaculties();
        const activeFaculties = (faculties || [])
            .filter(f => !f.status || String(f.status).toLowerCase() === "active")
            .map(f => f.name)
            .filter(Boolean);

        facultySelect.innerHTML = '<option value="">Select Faculty</option>' +
            activeFaculties.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');

        if (activeFaculties.length === 0) {
            facultySelect.innerHTML = '<option value="">No active faculties found</option>';
        }
    } catch (error) {
        console.error("Failed to load faculties", error);
        facultySelect.innerHTML = '<option value="">Failed to load faculties</option>';
        alert("Could not load faculties. Please check that the backend is running and faculties are seeded.");
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
