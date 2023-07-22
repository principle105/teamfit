import clientPromise from "$lib/mongodb";
import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { User } from "$lib/types";

export const POST: RequestHandler = async ({ request }) => {
    const { userId, newData }: { userId: string; newData: Partial<User> } =
        await request.json();

    const usersCollection = (await clientPromise).db().collection("users");

    const user = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: newData }
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
            body: "User updated!",
        })
    );
};
