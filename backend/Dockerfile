# Dockerfile para el BACKEND de SpaceBook en PHP
# Coloca este archivo en la raíz de la carpeta backend/

FROM php:8.2-apache

# Habilitar módulo rewrite de Apache (necesario para los .htaccess)
RUN a2enmod rewrite

# Configurar Apache para que respete los .htaccess
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/override.conf \
    && a2enconf override

# Habilitar extensión curl (necesaria para llamar a Stripe)
RUN docker-php-ext-install curl 2>/dev/null || true

# Copiar el código del backend al directorio raíz de Apache
COPY . /var/www/html/

# Asegurarse de que Apache sirva desde la raíz del proyecto
# (donde están las carpetas api/, config/, src/, data/)
WORKDIR /var/www/html

EXPOSE 80
