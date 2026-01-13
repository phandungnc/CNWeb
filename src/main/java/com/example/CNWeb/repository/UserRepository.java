package com.example.CNWeb.repository;

import com.example.CNWeb.dto.Response.UserResponseDTO;
import com.example.CNWeb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByUserCode(String userCode);
    Optional<User> findByUserCode(String userCode);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    long countByRole_Name(String roleName);

    //tìm kiếm ng dùng tối ưu
    @Query("SELECT new com.example.CNWeb.dto.Response.UserResponseDTO(" +
            "u.id, u.userCode, u.fullName, u.email, u.phoneNumber, u.role.name) " +
            "FROM User u " +
            "WHERE u.role.name <> 'ADMIN' " +
            "AND (:roleName IS NULL OR u.role.name = :roleName) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "cast(function('unaccent', lower(u.fullName)) as string) LIKE cast(function('unaccent', lower(concat('%', :keyword, '%'))) as string) OR " +
            "cast(function('unaccent', lower(u.email)) as string) LIKE cast(function('unaccent', lower(concat('%', :keyword, '%'))) as string) OR " +
            "lower(u.userCode) LIKE lower(concat('%', :keyword, '%')))")
    List<UserResponseDTO> searchUsersCustom(@Param("keyword") String keyword,
                                            @Param("roleName") String roleName);

    //giáo viên không trong lớp học đó
    @Query("SELECT new com.example.CNWeb.dto.Response.UserResponseDTO(" +
            "u.id, u.userCode, u.fullName, u.email, u.phoneNumber, u.role.name) " +
            "FROM User u " +
            "WHERE u.role.name = 'TEACHER' " +
            "AND u.id NOT IN (SELECT cm.user.id FROM ClassMember cm WHERE cm.classEntity.id = :classId) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "cast(function('unaccent', lower(u.fullName)) as string) LIKE cast(function('unaccent', lower(concat('%', :keyword, '%'))) as string) OR " +
            "lower(u.userCode) LIKE lower(concat('%', :keyword, '%')))")
    List<UserResponseDTO> findTeachersAvailableForClass(@Param("classId") Integer classId,
                                                        @Param("keyword") String keyword);


    //học sinh k trong khóa học
    @Query("SELECT new com.example.CNWeb.dto.Response.UserResponseDTO(" +
            "u.id, u.userCode, u.fullName, u.email, u.phoneNumber, u.role.name) " +
            "FROM User u " +
            "WHERE u.role.name = 'STUDENT' " +
            "AND u.id NOT IN (" +
            "SELECT cm.user.id FROM ClassMember cm " +
            "WHERE cm.classEntity.course.id = :courseId" +
            ") " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "cast(function('unaccent', lower(u.fullName)) as string) LIKE cast(function('unaccent', lower(concat('%', :keyword, '%'))) as string) OR " +
            "lower(u.userCode) LIKE lower(concat('%', :keyword, '%')))")
    List<UserResponseDTO> findStudentsAvailableForCourse(@Param("courseId") Integer courseId,
                                                         @Param("keyword") String keyword);
    //tv trong lớp
    @Query("SELECT new com.example.CNWeb.dto.Response.UserResponseDTO(" +
            "u.id, u.userCode, u.fullName, u.email, u.phoneNumber, u.role.name) " +
            "FROM ClassMember cm JOIN cm.user u " +
            "WHERE cm.classEntity.id = :classId " +
            "AND u.role.name = :roleName " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "cast(function('unaccent', lower(u.fullName)) as string) LIKE cast(function('unaccent', lower(concat('%', :keyword, '%'))) as string) OR " +
            "lower(u.userCode) LIKE lower(concat('%', :keyword, '%')))")
    List<UserResponseDTO> findMembersByClassId(@Param("classId") Integer classId,
                                               @Param("roleName") String roleName,
                                               @Param("keyword") String keyword);
}

