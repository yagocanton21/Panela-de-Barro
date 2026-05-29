FROM nginx:alpine

# Ajusta permissões para o nginx rodar como não-root
RUN chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R 777 /var/cache/nginx /var/run /var/log/nginx

# Remove a configuração padrão para garantir que a nossa seja a única
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração customizada
COPY default.conf /etc/nginx/conf.d/default.conf

# Muda para o usuário não-root
USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
