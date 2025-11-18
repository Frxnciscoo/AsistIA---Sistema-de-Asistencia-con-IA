package com.example.User_Service.service;


import com.example.User_Service.Exceptions.DuplicatedResourceException;
import com.example.User_Service.dto.*;
import com.example.User_Service.entidad.*;
import com.example.User_Service.mapper.UsuarioHorarioMapper;
import com.example.User_Service.mapper.UsuarioMapper;
import com.example.User_Service.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioMapper usuarioMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CredencialesRepository credencialesRepository;



    @Autowired
    private UserHorarioRepository userHorarioRepository;

    @Autowired
    private HorarioRepository horarioRepository;

    @Autowired
    private UsuarioHorarioMapper usuarioHorarioMapper;



    private final PasswordEncoder passwordEncoder;

    @Autowired
    private RolRepository rolRepository;

    public UsuarioService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class); // Asegúrate de tener un logger


    @Transactional
    public UserResponseDto crearUsuario(UsuarioCreateDto usuarioCreateDto ){
        if (usuarioRepository.existsByCorreo(usuarioCreateDto.correo())){
            throw new DuplicatedResourceException("El correo " + usuarioCreateDto.correo() + "se encuentra en uso");
        }
        if (usuarioRepository.existsByDni(usuarioCreateDto.dni())){
            throw new DuplicatedResourceException("El dni" + usuarioCreateDto.dni() + "le pertenece a otra persona");
        }

        Rol rol = rolRepository.findById(usuarioCreateDto.idRol())
                .orElseThrow(() -> new ResourceNotFoundException("El rolque buscas no existe"));


        Usuario usuario = usuarioMapper.toEntity(usuarioCreateDto);
        usuario.setRol(rol);
        Usuario guardar = usuarioRepository.save(usuario);


        String contrasenaEncriptada = passwordEncoder.encode(usuarioCreateDto.contrasena());

        Credenciales nuevaCredencial = new Credenciales(guardar,contrasenaEncriptada);


        credencialesRepository.save(nuevaCredencial);

        return usuarioMapper.toResponseDto(guardar);


    }

    public List<UserResponseDto> listarUsuarioso(){
        return usuarioRepository.findAll()
                .stream()
                .map(usuarioMapper::toResponseDto)
                .toList();
    }


    public UserResponseDto actualizarCliente(@PathVariable Long idUsuario,  UserUpdateDto userUpdateDto){
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado el usuario"));

        usuarioMapper.updateEntityFromDto(userUpdateDto, usuario);

        Usuario actualizado = usuarioRepository.save(usuario);

        return usuarioMapper.toResponseDto(actualizado);
    }


    public void eliminarUsuario(@PathVariable Long idUsuario){
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado el usuario"));

        usuario.setEstado(false);

        usuarioRepository.save(usuario);
    }

   public UserAuthResponde endPoint (String correo){
       Credenciales credenciales = credencialesRepository.findByUsuario_Correo(correo)
               .orElseThrow(() -> new RuntimeException("No se ha encontrado el correo"));
        return usuarioMapper.toAuthResponseDto(credenciales);
   }


   public  void asignarHorario(Long idUsuario, AsignacionHorario dto){

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado el id del usuario"));

       Horario horario = horarioRepository.findById(dto.idHorario())
               .orElseThrow(() -> new RuntimeException("No se encontro el id del Horario"));


       UserHorario usuarioHorario = usuarioHorarioMapper.toEntity(dto);
       usuarioHorario.setUsuario(usuario);
       usuarioHorario.setHorario(horario);

       userHorarioRepository.save(usuarioHorario);



   }


    public List<AsignacionHorarioResponseDto> listarHorariosPorUsuario(Long idUsuario){

        List<UserHorario> usuarioHorarios = userHorarioRepository.findByUsuario_IdUsuario(idUsuario);

        return usuarioHorarios.stream()
                .map(usuarioHorarioMapper::toResponseDto)
                .collect(Collectors.toList());
    }


    public HorarioAsignadoDto obtenerHorarioActualPorHorario(Long idUsuario){
        LocalDate hoy = LocalDate.now();

        logger.info("==> Buscando horario para usuario ID: {} en la fecha: {}", idUsuario, hoy);


        UserHorario userHorario = userHorarioRepository.findHorarioAsignadoPorFecha(idUsuario,hoy)
                .orElseThrow(() -> new RuntimeException("No se ha asignado un horario para el usuario"));
        logger.error("==> ¡No se encontró horario para el usuario ID: {}!", idUsuario);


        Horario horario = userHorario.getHorario();
        logger.info("==> ¡Horario encontrado! Devolviendo DTO para el horario: {}", horario.getNombreHorario());


        return new HorarioAsignadoDto(horario.getHoraEntrada(), horario.getToleranciaMin());


    }


    @Transactional
    public UserResponseDto subirImagenUsuario(Long idUsuario, MultipartFile imagen) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        try {
            // Validar imagen
            if (imagen.isEmpty() || !imagen.getContentType().startsWith("image/")) {
                throw new RuntimeException("Archivo no válido");
            }
            if (imagen.getSize() > 5 * 1024 * 1024) {  // 5MB límite
                throw new RuntimeException("Imagen demasiado grande");
            }

            // Generar nombre único
            String originalFilename = imagen.getOriginalFilename();
            String extension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String fileName = UUID.randomUUID().toString() + extension;
            Path uploadDir = Paths.get("uploads/usuarios");
            Files.createDirectories(uploadDir);
            Path filePath = uploadDir.resolve(fileName);

            // Guardar archivo
            Files.copy(imagen.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Actualizar usuario con la URL/path
            usuario.setImagen("/uploads/usuarios/" + fileName);
            usuarioRepository.save(usuario);

            return usuarioMapper.toResponseDto(usuario);
        } catch (Exception e) {
            throw new RuntimeException("Error al subir imagen: " + e.getMessage());
        }
    }

    // filepath: c:\PROYECTOS\Proyecto SOA\AsistIA---Sistema-de-Asistencia-con-IA\Back\User-Service\src\main\java\com\example\User_Service\service\UsuarioService.java
// ...existing code...

public Usuario buscarUsuarioPorId(Long idUsuario) {
    return usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
}

// ...existing code...

}
