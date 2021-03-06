import request from 'supertest';
import { app } from '../../app';

it('should responds with details about the current user', async () => {
    const cookie = await global.getCookie();

    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');

});

// it('should returns a 401 with missing cookie', async () => {
//     await request(app)
//         .get('/api/users/currentuser')
//         .send()
//         .expect(401);
// });

