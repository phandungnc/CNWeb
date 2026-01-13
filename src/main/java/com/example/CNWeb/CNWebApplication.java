package com.example.CNWeb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class CNWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(CNWebApplication.class, args);
	}

}
