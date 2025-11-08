import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class generate_hash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("demo1234");
        System.out.println("BCrypt hash for 'demo1234': " + hash);
        
        // Test the hash
        boolean matches = encoder.matches("demo1234", hash);
        System.out.println("Hash matches 'demo1234': " + matches);
    }
}