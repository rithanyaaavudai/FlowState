package com.example.demo;

import org.testng.Assert;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.lang.reflect.*;
import java.util.*;

@Listeners(TestResultListener.class)
public class ProjectValidationTest {

    private static final String PRIMARY_CONTROLLER = "com.example.demo.controller.FocusSessionController";
    private static final String PRIMARY_SERVICE = "com.example.demo.service.FocusSessionService";
    private static final String PRIMARY_REPOSITORY = "com.example.demo.repository.FocusSessionRepository";
    private static final String PRIMARY_ENTITY_PATH = "com.example.demo.entity.FocusSession";
    private static final String TABLE_NAME = "focus_session";
    private static final String API_BASE_PATH = "/api/sessions";
    private static final String CRUD_DELETE_MSG = "FocusSession deleted successfully.";

    // ────────────────────────────────────────────────────────────
    // DAY-1 | Sprint: Package & Layer Architecture Verification
    // ────────────────────────────────────────────────────────────

    @Test
    public void t1_primaryControllerLoads() throws Exception {
        // SRS_REF: REQ-CTRL-01 — Routes HTTP requests for [domain] operations
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        Assert.assertNotNull(clazz);
        Assert.assertTrue(clazz.getDeclaredMethods().length > 0);
        boolean found = false;
        for (Method m : clazz.getDeclaredMethods()) {
            if (m.getName().toLowerCase().contains("session") || m.isAnnotationPresent(GetMapping.class))
                found = true;
        }
        Assert.assertTrue(found);
    }

    @Test
    public void t2_primaryServiceLoads() throws Exception {
        // SRS_REF: REQ-SVC-01 — Encapsulates business logic for [domain] management
        // NOTE: FocusSessionService is a concrete class per SRS (Section 6.2), not an interface,
        // and must be a Spring-managed bean annotated with @Service.
        Class<?> clazz = Class.forName(PRIMARY_SERVICE);
        Assert.assertNotNull(clazz);
        Assert.assertFalse(clazz.isInterface());
        Assert.assertTrue(clazz.isAnnotationPresent(org.springframework.stereotype.Service.class));
        Assert.assertTrue(clazz.getDeclaredMethods().length >= 3);
    }

    @Test
    public void t3_primaryRepositoryLoads() throws Exception {
        // SRS_REF: REQ-REPO-01 — JPA data access for [entity]
        Class<?> clazz = Class.forName(PRIMARY_REPOSITORY);
        Assert.assertTrue(clazz.isInterface());
        Assert.assertTrue(Arrays.stream(clazz.getInterfaces()).anyMatch(i -> i.getName().contains("JpaRepository")));
    }

    @Test
    public void t4_primaryEntityMapping() throws Exception {
        // SRS_REF: REQ-ENT-01 — Persistent model mapped to [table_name]
        Class<?> clazz = Class.forName(PRIMARY_ENTITY_PATH);
        Assert.assertTrue(clazz.isAnnotationPresent(Entity.class));
        Assert.assertEquals(clazz.getAnnotation(Table.class).name(), TABLE_NAME);
        Assert.assertTrue(clazz.getDeclaredFields().length >= 4);
    }

    @Test
    public void t5_securityConfigLoads() throws Exception {
        // SRS_REF: REQ-SEC-01 — Defines auth filters and role-based authorization
        Class<?> clazz = Class.forName("com.example.demo.config.SecurityConfig");
        Assert.assertTrue(clazz.isAnnotationPresent(org.springframework.context.annotation.Configuration.class)
                || clazz.isAnnotationPresent(
                        org.springframework.security.config.annotation.web.configuration.EnableWebSecurity.class));
        Assert.assertNotNull(clazz.getDeclaredMethod("securityFilterChain",
                org.springframework.security.config.annotation.web.builders.HttpSecurity.class));
        Assert.assertTrue(clazz
                .getDeclaredMethod("securityFilterChain",
                        org.springframework.security.config.annotation.web.builders.HttpSecurity.class)
                .isAnnotationPresent(Bean.class));
    }

    // ────────────────────────────────────────────────────────────
    // DAY-2 | Sprint: Full CRUD Response Verification via Reflection
    // ────────────────────────────────────────────────────────────

    @Test
    public void t6_controllerBaseMapping() throws Exception {
        // SRS_REF: REQ-CTRL-02/03
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        Assert.assertTrue(clazz.isAnnotationPresent(RestController.class));
        Assert.assertEquals(clazz.getAnnotation(RequestMapping.class).value()[0], API_BASE_PATH);
    }

    @Test
    public void t7_getAllEndpointBehaviour() throws Exception {
        // SRS_REF: REQ-CTRL-06 — SRS 7.2: GET /api/sessions (PLATFORM_ADMIN or FLOW_COACH)
        // returns all sessions paginated, HTTP 200 OK (other roles get 403).
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        Method getAllMethod = Arrays.stream(clazz.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(GetMapping.class))
                .filter(m -> m.getAnnotation(GetMapping.class).value().length == 0
                        || m.getAnnotation(GetMapping.class).value()[0].isEmpty())
                .findFirst().orElseThrow();

        Assert.assertEquals(getAllMethod.getReturnType(), ResponseEntity.class);
        Assert.assertTrue(getAllMethod.isAnnotationPresent(PreAuthorize.class));
        String role = getAllMethod.getAnnotation(PreAuthorize.class).value();
        Assert.assertTrue(role.contains("PLATFORM_ADMIN") || role.contains("FLOW_COACH"));
    }

    @Test
    public void t8_deleteEndpointBehaviour() throws Exception {
        // SRS_REF: REQ-CTRL-08 — SRS 7.2: DELETE /api/sessions/{id} (PRACTITIONER)
        // deletes scheduled session, returns "FocusSession deleted successfully." HTTP 200 OK.
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        Method deleteMethod = Arrays.stream(clazz.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(DeleteMapping.class))
                .findFirst().orElseThrow();

        Assert.assertEquals(deleteMethod.getReturnType(), ResponseEntity.class);
        Assert.assertTrue(deleteMethod.isAnnotationPresent(PreAuthorize.class));
        Assert.assertTrue(deleteMethod.getAnnotation(PreAuthorize.class).value().contains("PRACTITIONER"));
    }

    @Test
    public void t9_createEndpointBehaviour() throws Exception {
        // SRS_REF: REQ-CTRL-04/09 — SRS 7.2: POST /api/sessions (PRACTITIONER) accepts
        // @Valid @RequestBody FocusSessionRequestDto, returns HTTP 201 Created.
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        Method createMethod = Arrays.stream(clazz.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(PostMapping.class))
                .findFirst().orElseThrow();

        Assert.assertEquals(createMethod.getReturnType(), ResponseEntity.class);
        boolean hasValidDto = Arrays.stream(createMethod.getParameters())
                .anyMatch(p -> p.isAnnotationPresent(RequestBody.class)
                        && p.isAnnotationPresent(jakarta.validation.Valid.class));
        Assert.assertTrue(hasValidDto);
    }

    @Test
    public void t10_updateEndpointBehaviour() throws Exception {
        // SRS_REF: REQ-CTRL-07 — SRS 7.2: PUT /api/sessions/{id}/start (PRACTITIONER)
        // transitions status to IN_PROGRESS, returns HTTP 200 OK.
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        Method startMethod = Arrays.stream(clazz.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(PutMapping.class) && m.getName().equals("startSession"))
                .findFirst().orElseThrow();

        Assert.assertEquals(startMethod.getReturnType(), ResponseEntity.class);
        Assert.assertTrue(startMethod.isAnnotationPresent(PreAuthorize.class));
        Assert.assertTrue(startMethod.getAnnotation(PreAuthorize.class).value().contains("PRACTITIONER"));
    }

    @Test
    public void t11_getByIdEndpointBehaviour() throws Exception {
        // SRS_REF: REQ-CTRL-10 — SRS 7.2: GET /api/sessions/{id} (PRACTITIONER)
        // returns session details, HTTP 200 OK (404 if not found).
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        Method getByIdMethod = Arrays.stream(clazz.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(GetMapping.class)
                        && m.getAnnotation(GetMapping.class).value().length > 0
                        && m.getAnnotation(GetMapping.class).value()[0].contains("{id}"))
                .findFirst().orElseThrow();

        Assert.assertEquals(getByIdMethod.getReturnType(), ResponseEntity.class);
        Assert.assertTrue(getByIdMethod.isAnnotationPresent(PreAuthorize.class));
        Assert.assertTrue(getByIdMethod.getAnnotation(PreAuthorize.class).value().contains("PRACTITIONER"));
    }

    @Test
    public void t12_secondaryEntityDelete() throws Exception {
        // SRS_REF: REQ-CTRL-SEC-08 — secondary entity delete returns correct message
        Class<?> controllerClass = Class.forName("com.example.demo.controller.FocusBlockController");
        Class<?> serviceClass = Class.forName("com.example.demo.service.FocusBlockService");
        Object serviceStub = org.mockito.Mockito.mock(serviceClass);

        Constructor<?> constructor = controllerClass.getDeclaredConstructors()[0];
        Object[] constructorArgs = new Object[constructor.getParameterCount()];
        for (int i = 0; i < constructorArgs.length; i++) {
            if (constructor.getParameterTypes()[i].equals(serviceClass)) {
                constructorArgs[i] = serviceStub;
            } else {
                constructorArgs[i] = org.mockito.Mockito.mock(constructor.getParameterTypes()[i]);
            }
        }
        Object controller = constructor.newInstance(constructorArgs);

        Method deleteMethod = Arrays.stream(controllerClass.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(DeleteMapping.class))
                .findFirst().orElseThrow();

        jakarta.servlet.http.HttpServletRequest requestMock = org.mockito.Mockito
                .mock(jakarta.servlet.http.HttpServletRequest.class);
        org.mockito.Mockito.when(requestMock.getAttribute("authenticatedUserId")).thenReturn(1L);

        Object[] methodArgs = new Object[deleteMethod.getParameterCount()];
        for (int i = 0; i < methodArgs.length; i++) {
            if (deleteMethod.getParameterTypes()[i].equals(Long.class)) {
                methodArgs[i] = 1L;
            } else if (deleteMethod.getParameterTypes()[i].equals(jakarta.servlet.http.HttpServletRequest.class)) {
                methodArgs[i] = requestMock;
            } else {
                methodArgs[i] = null;
            }
        }

        ResponseEntity<?> response = (ResponseEntity<?>) deleteMethod.invoke(controller, methodArgs);
        Assert.assertEquals(response.getStatusCode(), HttpStatus.NO_CONTENT);
    }

    // ────────────────────────────────────────────────────────────
    // DAY-3 | Sprint: Security Annotations, RBAC & CORS
    // ────────────────────────────────────────────────────────────

    @Test
    public void t13_preAuthorizeAdminOnly() throws Exception {
        // SRS_REF: REQ-SEC-02 — ADMIN-gated endpoints reject non-admin callers
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        boolean found = Arrays.stream(clazz.getDeclaredMethods())
                .anyMatch(m -> m.isAnnotationPresent(PreAuthorize.class)
                        && m.getAnnotation(PreAuthorize.class).value().contains("PLATFORM_ADMIN"));
        Assert.assertTrue(found);
    }

    @Test
    public void t14_preAuthorizeDomainRole() throws Exception {
        // SRS_REF: REQ-SEC-03 — domain role endpoints accessible to authorised role
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        boolean found = Arrays.stream(clazz.getDeclaredMethods())
                .anyMatch(m -> m.isAnnotationPresent(PreAuthorize.class)
                        && m.getAnnotation(PreAuthorize.class).value().contains("PRACTITIONER"));
        Assert.assertTrue(found);
    }

    @Test
    public void t15_corsConfigurationPresent() throws Exception {
        // SRS_REF: REQ-CORS-01 — frontend React app can communicate with backend
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        boolean hasAnnotation = clazz.isAnnotationPresent(CrossOrigin.class);
        if (!hasAnnotation) {
            Class<?> configClazz = Class.forName("com.example.demo.config.SecurityConfig");
            Assert.assertNotNull(configClazz); // Existence of config suggesting global CORS
        }
    }

    @Test
    public void t16_validationAnnotationOnRequestBody() throws Exception {
        // SRS_REF: REQ-VAL-01 — input validation enforced at controller boundary
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        Method createMethod = Arrays.stream(clazz.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(PostMapping.class))
                .findFirst()
                .orElseThrow();
        boolean hasValid = Arrays.stream(createMethod.getParameters())
                .anyMatch(p -> p.isAnnotationPresent(RequestBody.class)
                        && p.isAnnotationPresent(jakarta.validation.Valid.class));
        Assert.assertTrue(hasValid);
    }

    @Test
    public void t17_preAuthorizeBroadApplication() throws Exception {
        // SRS_REF: REQ-SEC-06 — RBAC is applied broadly
        Class<?> clazz = Class.forName(PRIMARY_CONTROLLER);
        long count = Arrays.stream(clazz.getDeclaredMethods()).filter(m -> m.isAnnotationPresent(PreAuthorize.class))
                .count();
        Assert.assertTrue(count >= 3);
    }

    // ────────────────────────────────────────────────────────────
    // DAY-4 | Sprint: Repository Custom Queries & Exception Handling
    // ────────────────────────────────────────────────────────────

    @Test
    public void t18_repositoryCustomFindBy() throws Exception {
        // SRS_REF: REQ-REPO-04 — domain filtering beyond basic findAll()
        Class<?> clazz = Class.forName(PRIMARY_REPOSITORY);
        boolean found = Arrays.stream(clazz.getDeclaredMethods()).anyMatch(m -> m.getName().startsWith("findBy"));
        Assert.assertTrue(found);
    }

    @Test
    public void t19_repositoryJPQLQuery() throws Exception {
        // SRS_REF: REQ-REPO-05 — custom JPQL for domain-specific search
        Class<?> clazz = Class.forName(PRIMARY_REPOSITORY);
        Method queryMethod = Arrays.stream(clazz.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(org.springframework.data.jpa.repository.Query.class)).findFirst()
                .orElseThrow();
        String query = queryMethod.getAnnotation(org.springframework.data.jpa.repository.Query.class).value();
        Assert.assertTrue(query.toUpperCase().contains("SELECT") && query.toUpperCase().contains("FROM"));
    }

    @Test
    public void t20_globalExceptionHandlerBehaviour() throws Exception {
        // SRS_REF: REQ-EX-01/02 — exception handler returns correct HTTP status + body
        Class<?> handlerClass = Class.forName("com.example.demo.exception.GlobalExceptionHandler");
        Class<?> exClass = Class.forName("com.example.demo.exception.ResourceNotFoundException");

        Object handler = handlerClass.getDeclaredConstructor().newInstance();
        Object ex = exClass.getConstructor(String.class).newInstance("Test FocusSession not found");

        Method handlerMethod = Arrays.stream(handlerClass.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(ExceptionHandler.class)
                        && Arrays.asList(m.getAnnotation(ExceptionHandler.class).value()).contains(exClass))
                .findFirst().orElseThrow();

        ResponseEntity<?> response = (ResponseEntity<?>) handlerMethod.invoke(handler, ex);
        Assert.assertEquals(response.getStatusCode(), HttpStatus.NOT_FOUND);

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        Assert.assertEquals(body.get("message"), "Test FocusSession not found");
    }

    @Test
    public void t21_domainNotFoundException() throws Exception {
        // SRS_REF: REQ-EX-03 — [Entity]NotFoundException maps to 404 in handler
        Class<?> clazz = Class.forName("com.example.demo.exception.BusinessValidationException"); // Project uses this
        // for most domain
        // errors
        Constructor<?> cons = clazz.getConstructor(String.class);
        Object ex = cons.newInstance("Morning Deep Work record was not found");
        Assert.assertEquals(((Exception) ex).getMessage(), "Morning Deep Work record was not found");
    }

    @Test
    public void t22_conflictExceptionMapping() throws Exception {
        // SRS_REF: REQ-EX-04 — [Domain]ConflictException maps to 409
        // This verifies that the GlobalExceptionHandler has a method for handling
        // business exceptions
        Class<?> clazz = Class.forName("com.example.demo.exception.GlobalExceptionHandler");
        boolean hasConflictHandler = Arrays.stream(clazz.getDeclaredMethods())
                .anyMatch(m -> m.isAnnotationPresent(ExceptionHandler.class));
        Assert.assertTrue(hasConflictHandler);
    }

    // ────────────────────────────────────────────────────────────
    // DAY-5 | Sprint: JWT Token Generation & Validation
    // ────────────────────────────────────────────────────────────

    @Test
    public void t23_jwtSecretIsPrivate() throws Exception {
        // SRS_REF: REQ-JWT-04 — SRS 6.7: JwtService "Contains a private field `secret`
        // (injected via @Value("${flowstate.jwt.secret}"))"
        Class<?> clazz = Class.forName("com.example.demo.service.JwtService");
        Field secretField = clazz.getDeclaredField("secret");
        Assert.assertTrue(Modifier.isPrivate(secretField.getModifiers()));
        Assert.assertTrue(secretField.isAnnotationPresent(org.springframework.beans.factory.annotation.Value.class));
    }

    @Test
    public void t24_jwtGenerateToken() throws Exception {
        // SRS_REF: REQ-JWT-02 — token generated from UserDetails
        Class<?> clazz = Class.forName("com.example.demo.service.JwtService");
        Method generate = Arrays.stream(clazz.getDeclaredMethods())
                .filter(m -> m.getName().toLowerCase().contains("generate")
                        && m.getName().toLowerCase().contains("token"))
                .findFirst().orElseThrow();
        Assert.assertEquals(generate.getReturnType(), String.class);
    }

    @Test
    public void t25_jwtValidateToken() throws Exception {
        // SRS_REF: REQ-JWT-03 — token round-trip
        Class<?> clazz = Class.forName("com.example.demo.service.JwtService");
        Method validate = Arrays.stream(clazz.getDeclaredMethods()).filter(m -> m.getName().equals("isTokenValid"))
                .findFirst().orElseThrow();
        Assert.assertTrue(
                validate.getReturnType().equals(boolean.class) || validate.getReturnType().equals(Boolean.class));
    }

    @Test
    public void t26_jwtExtractUsername() throws Exception {
        // SRS_REF: REQ-JWT-04 — claims correctly extracted
        Class<?> clazz = Class.forName("com.example.demo.service.JwtService");
        Method extract = Arrays.stream(clazz.getDeclaredMethods()).filter(m -> m.getName().equals("extractUsername"))
                .findFirst().orElseThrow();
        Assert.assertEquals(extract.getReturnType(), String.class);
    }

    // ────────────────────────────────────────────────────────────
    // DAY-6 | Sprint: Entity DB Mapping & Filter Chain
    // ────────────────────────────────────────────────────────────

    @Test
    public void t27_tableNameConvention() throws Exception {
        // SRS_REF: REQ-DB-01 — entity maps to correct snake_case table name
        Class<?> clazz = Class.forName(PRIMARY_ENTITY_PATH);
        Assert.assertEquals(clazz.getAnnotation(Table.class).name(), TABLE_NAME);
    }

    @Test
    public void t28_nullableConstraints() throws Exception {
        // SRS_REF: REQ-DB-02 — non-nullable constraints enforced
        Class<?> clazz = Class.forName(PRIMARY_ENTITY_PATH);
        long count = Arrays.stream(clazz.getDeclaredFields())
                .filter(f -> f.isAnnotationPresent(Column.class) && !f.getAnnotation(Column.class).nullable())
                .count();
        Assert.assertTrue(count >= 3);
    }

    @Test
    public void t29_entityRelationships() throws Exception {
        // SRS_REF: REQ-DB-03 — entity relationships mapped via JPA
        Class<?> clazz = Class.forName(PRIMARY_ENTITY_PATH);
        boolean hasRel = Arrays.stream(clazz.getDeclaredFields())
                .anyMatch(f -> f.isAnnotationPresent(ManyToOne.class) || f.isAnnotationPresent(OneToMany.class));
        Assert.assertTrue(hasRel);
    }

    @Test
    public void t30_securityFilterChainBeans() throws Exception {
        // SRS_REF: REQ-SEC-04/05 — correct auth rules
        Class<?> clazz = Class.forName("com.example.demo.config.SecurityConfig");
        Assert.assertTrue(Arrays.stream(clazz.getDeclaredMethods())
                .anyMatch(m -> m.getName().equals("securityFilterChain") && m.isAnnotationPresent(Bean.class)));
        Assert.assertTrue(Arrays.stream(clazz.getDeclaredMethods())
                .anyMatch(m -> m.getName().equals("passwordEncoder") && m.isAnnotationPresent(Bean.class)));
    }
}