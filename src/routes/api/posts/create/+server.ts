import clientPromise from "$lib/mongodb";
import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { Reply, Post } from "$lib/types";

export const POST: RequestHandler = async ({ request }) => {
    const { userId, content, date }: Reply = await request.json();

    // TODO: do some validation here

    const usersCollection = (await clientPromise).db().collection("users");

    const post: Post = {
        userId,
        content,
        date,
        replies: [],
    };

    const user = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $push: {
                posts: post,
            },
            $inc: {
                points: 5,
            },
        }
    );

    if (!user) {
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
            body: post,
        })
    );
};
