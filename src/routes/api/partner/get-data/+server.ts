import clientPromise from "$lib/mongodb";
import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { DatabaseUser, Friend } from "$lib/types";

export const GET: RequestHandler = async ({ url: { searchParams } }) => {
    const partnerId = searchParams.get("partnerId");

    if (partnerId === null) {
        return new Response(
            JSON.stringify({
                error: "No user ID provided",
            }),
            {
                status: 400,
            }
        );
    }

    const usersCollection = (await clientPromise).db().collection("users");

    const partnerUser = (await usersCollection.findOne({
        _id: new ObjectId(partnerId),
    })) as DatabaseUser;

    if (partnerUser === null) {
        return new Response(
            JSON.stringify({
                error: "No partner found with that ID",
            }),
            {
                status: 400,
            }
        );
    }

    const partner = {
        id: partnerUser.id,
        firstName: partnerUser.firstName,
        lastName: partnerUser.lastName,
        image: partnerUser.image,
        description: partnerUser.description,
        goals: partnerUser.goals,
        posts: partnerUser.posts,
        commonGoals: [],
    } satisfies Friend;

    return new Response(JSON.stringify({ partner }));
};
