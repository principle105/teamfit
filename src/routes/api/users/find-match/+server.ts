import clientPromise from "$lib/mongodb";
import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { DatabaseUser, Friend } from "$lib/types";

export const GET: RequestHandler = async ({ url: { searchParams } }) => {
    const userId = searchParams.get("userId");

    if (userId === null) {
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

    const currentUser = (await usersCollection.findOne({
        _id: new ObjectId(userId),
    })) as DatabaseUser;

    // Get all users that have at least one goal and not paired with a friend
    const users = await usersCollection
        .find({
            friend: null,
            goals: { $ne: {} },
            _id: { $ne: new ObjectId(userId) },
        })
        .toArray();

    // Filter the users that share at least one goal with the current user
    let usersWithSharedGoals = users.map((user) => {
        user = user as DatabaseUser;

        let commonGoals: string[] = [];

        for (const key in user.goals) {
            if (user.goals[key] === currentUser.goals[key]) {
                commonGoals.push(key);
            }
        }

        if (commonGoals.length > 0) {
            return {
                id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                description: user.description,
                image: user.image,
                goals: user.goals,
                commonGoals: commonGoals,
                posts: user.posts,
            } satisfies Friend;
        }

        return null;
    });

    // Removing null values
    usersWithSharedGoals = usersWithSharedGoals.filter((user) => user !== null);

    if (usersWithSharedGoals.length === 0) {
        return new Response(
            JSON.stringify({
                error: "No users were found",
            }),
            {
                status: 400,
            }
        );
    }

    // Ordering by most matches
    let sortedUsers = (usersWithSharedGoals as Friend[]).sort((a, b) => {
        if (a.commonGoals.length > b.commonGoals.length) {
            return -1;
        }
        if (a.commonGoals.length < b.commonGoals.length) {
            return 1;
        }
        return 0;
    });

    // Finding the best match
    const match = sortedUsers[0];

    // Updating both users' friend field
    await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { friend: match.id } }
    );
    await usersCollection.updateOne(
        { _id: new ObjectId(match.id) },
        { $set: { friend: userId } }
    );

    return new Response(
        JSON.stringify({
            match,
        })
    );
};
