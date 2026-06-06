import { client } from '../../../services/client';
import { endpoints } from '../../../services/endpoints';

 
export const apiLoginWithGoogle = async (idToken) => {
    // const response = await client.post(endpoints.signInWithGoogle, { id_token: idToken });
    // return response.data;
    return {
        user: {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
        },
        token: '1234567890',
    };
};

