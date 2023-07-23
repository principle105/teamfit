import clientPromise from "$lib/mongodb";
import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { User } from "$lib/types";

interface RequestParams {
    userId: string;
    goals: User["goals"];
    firstName: string;
    lastName: string;
    description: string;
}

export const POST: RequestHandler = async ({ request }) => {
    const { userId, goals, firstName, lastName, description }: RequestParams =
        await request.json();

    // TODO: do some validation here

    const usersCollection = (await clientPromise).db().collection("users");

    const user = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                firstName,
                lastName,
                description,
                goals,
                surveyCompleted: true,
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
            body: "User updated!",
        })
    );
};
