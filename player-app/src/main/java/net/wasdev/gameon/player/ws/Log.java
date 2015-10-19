/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
package net.wasdev.gameon.player.ws;

import java.util.logging.Level;
import java.util.logging.Logger;

public class Log {
	private final static Logger log = Logger.getLogger("net.wasdev.gameon.player.ws");
	private static final String endpoint_log_format = "%-10s: %s";

	public static void log(Level level, Object source, String message, Object ... args) {
		if ( log.isLoggable(level)) {
			String msg = String.format(endpoint_log_format, getHash(source), message);
			log.log(level, msg, args);
		}
	}

	public static void log(Level level, Object source, String message, Throwable thrown) {
		if ( log.isLoggable(level)) {
			String msg = String.format(endpoint_log_format, getHash(source), message);
			log.log(level, msg, thrown);
		}
	}

	private static String getHash(Object source) {
		return source == null ? "null" : Integer.toString(System.identityHashCode(source));
	}
}
