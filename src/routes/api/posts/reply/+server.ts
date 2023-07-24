import clientPromise from "$lib/mongodb";
import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { Reply } from "$lib/types";

interface ReplyParams {
    userId: string;
    partnerId: string;
    date: number;
    postIndex: number;
    content: any;
}

export const POST: RequestHandler = async ({ request }) => {
    const { userId, partnerId, postIndex, date, content }: ReplyParams =
        await request.json();

    // TODO: do some validation here

    const usersCollection = (await clientPromise).db().collection("users");

    const reply: Reply = {
        userId,
        content,
        date,
    };

    const partnerUser = await usersCollection.updateOne(
        { _id: new ObjectId(partnerId) },
        {
            $push: {
                [`posts.${postIndex}.replies`]: reply,
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
            body: "Reply posted!",
        })
    );
};
