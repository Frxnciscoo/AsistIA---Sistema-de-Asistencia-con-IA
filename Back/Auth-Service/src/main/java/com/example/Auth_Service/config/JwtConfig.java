package com.example.Auth_Service.config;

import com.nimbusds.jose.util.StandardCharset;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import org.springframework.core.env.Environment;

@Configuration
@EnableConfigurationProperties (RsaKeyCon.class)
public class JwtConfig {

    private final RsaKeyCon rsaKeyCon;

    public JwtConfig(RsaKeyCon rsaKeyCon) {
        this.rsaKeyCon = rsaKeyCon;
    }
    @Bean
    public RSAPublicKey rsaPublicKey() throws Exception {
        String publicKeyPath = rsaKeyCon.publicKey();


        if (publicKeyPath.startsWith("classpath:")) {
            publicKeyPath = publicKeyPath.substring("classpath:".length());
        }

        // pasamos la ruta limpia a ClassPathResource
        var resource = new ClassPathResource(publicKeyPath);

        String key = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String publicKeyPEM = key.replace("-----BEGIN PUBLIC KEY-----", "").replaceAll(System.lineSeparator(), "").replace("-----END PUBLIC KEY-----", "");
        byte[] encoded = Base64.getDecoder().decode(publicKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return (RSAPublicKey) keyFactory.generatePublic(new X509EncodedKeySpec(encoded));
    }

    @Bean
    public RSAPrivateKey rsaPrivateKey() throws Exception {

        String privateKeyPath = rsaKeyCon.privateKey();
        if (privateKeyPath.startsWith("classpath:")) {
            privateKeyPath = privateKeyPath.substring("classpath:".length());
        }
        var resource = new ClassPathResource(privateKeyPath);

        String key = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String privateKeyPEM = key.replace("-----BEGIN PRIVATE KEY-----", "").replaceAll(System.lineSeparator(), "").replace("-----END PRIVATE KEY-----", "");
        byte[] encoded = Base64.getDecoder().decode(privateKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return (RSAPrivateKey) keyFactory.generatePrivate(new PKCS8EncodedKeySpec(encoded));
    }



}
