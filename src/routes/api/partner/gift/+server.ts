import { badges } from "$lib/data";
import clientPromise from "$lib/mongodb";
import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

interface RequestParams {
    userId: string;
    partnerId: string;
    badgeName: string;
}

export const POST: RequestHandler = async ({ request }) => {
    const { userId, partnerId, badgeName }: RequestParams =
        await request.json();

    // TODO: do some validation here

    const usersCollection = (await clientPromise).db().collection("users");

    // Getting the badge from the badge name
    const badge = badges.find((badge) => badge.name === badgeName);

    if (badge === undefined) {
        return new Response(
            JSON.stringify({
                status: 404,
                body: "Badge not found!",
            })
        );
    }

    // Checking if the user has enough points to send the badge
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (user === null) {
        return new Response(
            JSON.stringify({
                status: 404,
                body: "User not found!",
            })
        );
    }

    if (user.points < badge.price) {
        return new Response(
            JSON.stringify({
                status: 400,
                body: "Not enough points!",
            })
        );
    }

    // Removing the points from the user
    await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $inc: {
                points: -badge.price,
            },
        }
    );

    // Adding the badge to the partner's badges array
    const partnerUser = await usersCollection.updateOne(
        { _id: new ObjectId(partnerId) },
        {
            $push: {
                badges: badgeName,
            },
        }
    );

    return new Response(
        JSON.stringify({
            status: 200,
            body: "Badge purchased!",
        })
    );
};
