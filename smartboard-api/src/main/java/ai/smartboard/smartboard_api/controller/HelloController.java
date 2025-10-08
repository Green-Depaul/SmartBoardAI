package ai.smartboard.smartboard_api.controller;

import ai.smartboard.smartboard_api.model.Greeting;
import ai.smartboard.smartboard_api.service.GreetingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class HelloController {

    private final GreetingService service;

    public HelloController(GreetingService service) {
        this.service = service;
    }

    @GetMapping("/hello")
    public Greeting hello(@RequestParam(required = false) String name) {
        return new Greeting(service.makeGreeting(name));
    }
}
