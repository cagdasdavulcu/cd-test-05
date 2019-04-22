import * as supertest from "supertest";

import { app } from "../server";

describe("Server tests", () => {
    it("should response", (done) => {
        const server = supertest(app);
        server.get("/")
            .expect(200)
            .end((err, res) => {
                if (err) {
                    throw err;
                }

                done();
            });
    });
});
