package com.example.gateway_service.Config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

//vinculamos nuestras key con las carpetas que creamos

@EnableConfigurationProperties
@ConfigurationProperties(prefix = "rsa")
public record RsaKeyCon(String publicKey, String privateKey) {
}
