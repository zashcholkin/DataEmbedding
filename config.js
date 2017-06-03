var config = {
    BITS_PER_CHAR: 7, //depends on used symbols in message
                     // for a-zA-Z0-9 use 7, for cyr use at least 12

    BITS_FOR_MESSAGE_LENGTH: 32
};

module.exports.config = config;
