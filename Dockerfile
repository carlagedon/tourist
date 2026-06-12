FROM postgis/postgis:16-3.4

# 1. Устанавливаем только минимальные зависимости
RUN apt-get update && apt-get install -y \
    build-essential \
    postgresql-server-dev-16 \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. Скачиваем, компилируем и устанавливаем pgvector (блокируем LLVM на всех этапах)
RUN cd /tmp && \
    git clone --branch v0.7.0 https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make with_llvm=no && \
    make install with_llvm=no && \
    rm -rf /tmp/pgvector

# 3. Чистим инструменты сборки
RUN apt-get remove -y build-essential git postgresql-server-dev-16 && \
    apt-get autoremove -y