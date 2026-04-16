FROM nginx:latest

# Remove a configuração padrão para garantir que a nossa seja a única
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração customizada
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
