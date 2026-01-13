package com.example.CNWeb.security;

import com.example.CNWeb.entity.User;
import com.example.CNWeb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userCode)
            throws UsernameNotFoundException {

        User user = userRepository.findByUserCode(userCode)
                .orElseThrow(() -> new UsernameNotFoundException("Người dùng không tồn tại"));

        return new CustomUserDetails(user);
    }
}
