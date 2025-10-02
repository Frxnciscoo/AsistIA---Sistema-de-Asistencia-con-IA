package com.example.User_Service.Exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateHorario extends RuntimeException{

    public DuplicateHorario(String message){
        super(message);
    }
}
