FROM ubuntu:24.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install LAMP stack prerequisites: Apache, MySQL Server, PHP, and required extensions
RUN apt-get update && apt-get install -y \
    apache2 \
    mysql-server \
    php \
    libapache2-mod-php \
    php-mysql \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Allow services like MySQL to start inside the container
RUN rm -f /usr/sbin/policy-rc.d || true

# Set working directory to Apache web root
WORKDIR /var/www/html

# Remove default Apache index page and copy project files
RUN rm -f /var/www/html/index.html
COPY . /var/www/html/

# Ensure proper permissions for web root
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# Provide a PHP wrapper so "php -S localhost:8000" binds to 0.0.0.0:8000
# allowing port forwarding (-p 8000:8000) from the host machine to reach the container
RUN printf '%s\n' \
    '#!/bin/bash' \
    'args=()' \
    'for arg in "$@"; do' \
    '    if [ "$arg" = "localhost:8000" ] || [ "$arg" = "127.0.0.1:8000" ]; then' \
    '        args+=("0.0.0.0:8000")' \
    '    else' \
    '        args+=("$arg")' \
    '    fi' \
    'done' \
    'exec /usr/bin/php "${args[@]}"' \
    > /usr/local/bin/php && \
    chmod +x /usr/local/bin/php

# Expose port 8000 for the PHP development server and 80 for Apache
EXPOSE 8000 80

# Default to a bash shell so the user can set up their database and run the server manually
CMD ["/bin/bash"]
