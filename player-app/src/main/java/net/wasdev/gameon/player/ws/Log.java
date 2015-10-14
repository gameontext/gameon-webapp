package net.wasdev.gameon.player.ws;

import java.util.logging.Level;
import java.util.logging.Logger;

public class Log {
    private final static Logger log = Logger.getLogger("net.wasdev.gameon.player.ws");
    static final String endpoint_log_format = "ws-%-10s: %s";

    public static void log(Level level, Object source, String message) {
        if ( log.isLoggable(level)) {
            String msg = String.format(endpoint_log_format,
                    source == null ? "null" : System.identityHashCode(source), message);

            log.log(level, msg);
        }
    }

    public static void log(Level level, Object source, String message, Throwable thrown) {
        String msg = String.format(endpoint_log_format,
                source == null ? "null" : System.identityHashCode(source), message);

        log.log(level, msg, thrown);
    }
}
