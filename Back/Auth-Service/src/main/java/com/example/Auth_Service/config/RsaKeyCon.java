package com.example.Auth_Service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

//vinculamos nuestras key con las carpetas que creamos

@ConfigurationProperties(prefix = "rsa")
public record RsaKeyCon(RSAPublicKey rsaPublicKey, RSAPrivateKey rsaPrivateKey) {
}
