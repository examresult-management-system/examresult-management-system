package com.exammanage.portal.faculty;
import jakarta.persistence.*;

@Entity
@Table(name = "faculties")
public class Faculty {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String code;
    private String dean;
    private String contactEmail;
    private String status;
    @Column(length = 1000)
    private String description;
    public Faculty() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public String getCode(){return code;} public void setCode(String code){this.code=code;}
    public String getDean(){return dean;} public void setDean(String dean){this.dean=dean;}
    public String getContactEmail(){return contactEmail;} public void setContactEmail(String contactEmail){this.contactEmail=contactEmail;}

    public String getStatus(){return status;} public void setStatus(String status){this.status=status;}
    public String getDescription(){return description;} public void setDescription(String description){this.description=description;}
}

