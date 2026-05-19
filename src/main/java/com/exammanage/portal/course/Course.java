package com.exammanage.portal.course;
<<<<<<< Updated upstream
import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private String name;
    private String duration;
    private String faculty;
    private Integer credits;
    private String status;
    @Column(length = 1000)
    private String description;

    public Course() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getCode(){return code;} public void setCode(String code){this.code=code;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public String getDuration(){return duration;} public void setDuration(String duration){this.duration=duration;}
    public String getFaculty(){return faculty;} public void setFaculty(String faculty){this.faculty=faculty;}
    public Integer getCredits(){return credits;} public void setCredits(Integer credits){this.credits=credits;}
    public String getStatus(){return status;} public void setStatus(String status){this.status=status;}
    public String getDescription(){return description;} public void setDescription(String description){this.description=description;}
}
=======
>>>>>>> Stashed changes

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private String name;
    private String duration;
    private String faculty;
    private Integer credits;
    private String status;
    @Column(length = 1000)
    private String description;

    public Course() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getCode(){return code;} public void setCode(String code){this.code=code;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public String getDuration(){return duration;} public void setDuration(String duration){this.duration=duration;}
    public String getFaculty(){return faculty;} public void setFaculty(String faculty){this.faculty=faculty;}
    public Integer getCredits(){return credits;} public void setCredits(Integer credits){this.credits=credits;}
    public String getStatus(){return status;} public void setStatus(String status){this.status=status;}
    public String getDescription(){return description;} public void setDescription(String description){this.description=description;}
}
