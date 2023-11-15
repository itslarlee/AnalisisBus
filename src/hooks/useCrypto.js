import { useMemo } from 'react';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

const useCrypto = () => {

    const secretKey = 'ulacit' // El 'secretKey' deberia estar en una variable de entorno, podria mejorarse mas adelante


    const encrypt = (data) => AES.encrypt(data, secretKey).toString();
    const decrypt = (ciphertext) => {
        const bytes = AES.decrypt(ciphertext, secretKey);
        return bytes.toString(Utf8);
    };

    return useMemo(() => ({
        encrypt,
        decrypt
    }), [secretKey]);
};

export default useCrypto;
