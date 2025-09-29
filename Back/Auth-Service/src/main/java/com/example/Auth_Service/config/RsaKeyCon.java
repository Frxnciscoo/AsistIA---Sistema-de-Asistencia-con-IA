package com.example.Auth_Service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

//vinculamos nuestras key con las carpetas que creamos

@EnableConfigurationProperties
@ConfigurationProperties(prefix = "rsa")
public record RsaKeyCon(String publicKey, String privateKey) {
}
