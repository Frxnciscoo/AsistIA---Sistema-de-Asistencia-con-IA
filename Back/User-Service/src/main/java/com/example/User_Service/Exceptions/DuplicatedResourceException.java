package com.example.User_Service.Exceptions;

public class DuplicatedResourceException extends RuntimeException{
    public DuplicatedResourceException(String mensaje){
        super(mensaje);
    }
}
