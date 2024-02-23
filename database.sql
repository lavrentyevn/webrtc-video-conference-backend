create TABLE user_model (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    refresh_token VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE
);

create TABLE guest(
    id SERIAL PRIMARY KEY,
    user_model_id INTEGER,
    FOREIGN KEY (user_model_id) REFERENCES user_model (id)
);

create TABLE client(
    id SERIAL PRIMARY KEY,
    user_model_id INTEGER,
    username VARCHAR(255),
    password VARCHAR(255),
    verified BOOLEAN,
    last_login TIMESTAMP WITHOUT TIME ZONE,
    FOREIGN KEY (user_model_id) REFERENCES user_model (id)
);

create TABLE email_verification(
    id SERIAL PRIMARY KEY,
    user_model_id INTEGER,
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    FOREIGN KEY (user_model_id) REFERENCES user_model (id)
);

create TABLE room(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    password VARCHAR(255),
    description VARCHAR(255),
    creator_id INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    FOREIGN KEY (creator_id) REFERENCES user_model (id)
);

create TABLE invitation(
    id SERIAL PRIMARY KEY,
    user_model_id INTEGER,
    room_id INTEGER,
    FOREIGN KEY (user_model_id) REFERENCES user_model (id),
    FOREIGN KEY (room_id) REFERENCES room (id)
);

create TABLE message(
    id SERIAL PRIMARY KEY,
    room_id INTEGER,
    user_model_id INTEGER,
    message_text VARCHAR(255),
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    FOREIGN KEY (user_model_id) REFERENCES user_model (id),
    FOREIGN KEY (room_id) REFERENCES room (id)
);

create TABLE event(
    id SERIAL PRIMARY KEY,
    room_id INTEGER,
    FOREIGN KEY (room_id) REFERENCES room (id)
);

create TABLE event_log(
    id SERIAL PRIMARY KEY,
    event_id INTEGER,
    user_model_id INTEGER,
    joined_at TIMESTAMP WITHOUT TIME ZONE,
    left_at TIMESTAMP WITHOUT TIME ZONE,
    FOREIGN KEY (user_model_id) REFERENCES user_model (id),
    FOREIGN KEY (event_id) REFERENCES event (id)
);