import clientPromise from "$lib/mongodb";
import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

interface RequestParams {
    userId: string;
    partnerId: string;
}

export const POST: RequestHandler = async ({ request }) => {
    const { userId, partnerId }: RequestParams = await request.json();

    // TODO: do some validation here

    const usersCollection = (await clientPromise).db().collection("users");

    const partnerUser = await usersCollection.updateOne(
        { _id: new ObjectId(partnerId) },
        {
            $set: {
                [`friendRequests.${userId}`]: Date.now(),
            },
        }
    );

    if (!partnerUser) {
        return new Response(
            JSON.stringify({
                status: 404,
                body: "User not found!",
            })
        );
    }

    return new Response(
        JSON.stringify({
            status: 200,
            body: "Request sent!",
        })
    );
};
