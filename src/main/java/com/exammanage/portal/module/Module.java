package com.exammanage.portal.module;
import jakarta.persistence.*;

@Entity
@Table(name = "modules")
public class Module {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String moduleCode;
    private String moduleName;
    private String course;
    private Integer credits;
    private String lecturer;
    private String semester;
    private String status;
    @Column(length = 1000)
    private String description;

    public Module() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getModuleCode(){return moduleCode;} public void setModuleCode(String moduleCode){this.moduleCode=moduleCode;}
    public String getModuleName(){return moduleName;} public void setModuleName(String moduleName){this.moduleName=moduleName;}
    public String getCode(){return moduleCode;} public void setCode(String code){this.moduleCode=code;}
    public String getName(){return moduleName;} public void setName(String name){this.moduleName=name;}
    public String getCourse(){return course;} public void setCourse(String course){this.course=course;}
    public Integer getCredits(){return credits;} public void setCredits(Integer credits){this.credits=credits;}
    public String getLecturer(){return lecturer;} public void setLecturer(String lecturer){this.lecturer=lecturer;}
    public String getSemester(){return semester;} public void setSemester(String semester){this.semester=semester;}
    public String getStatus(){return status;} public void setStatus(String status){this.status=status;}
    public String getDescription(){return description;} public void setDescription(String description){this.description=description;}
} 
