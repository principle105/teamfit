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

        let matchingGoals: string[] = [];

        for (const key in user.goals) {
            if (user.goals[key] === currentUser.goals[key]) {
                matchingGoals.push(key);
            }
        }

        if (matchingGoals.length > 0) {
            return {
                id: user._id.toString(),
                name: user.name,
                image: user.image,
                goals: user.goals,
                matchingGoals: matchingGoals,
            } as Friend;
        }

        return null;
    });

    // Removing null values
    usersWithSharedGoals = usersWithSharedGoals.filter((user) => user !== null);

    // Ordering by most matches
    let sortedUsers = (usersWithSharedGoals as Friend[]).sort((a, b) => {
        if (a.matchingGoals.length > b.matchingGoals.length) {
            return -1;
        }
        if (a.matchingGoals.length < b.matchingGoals.length) {
            return 1;
        }
        return 0;
    });

    // Getting the top 6 users

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

    return new Response(
        JSON.stringify({
            users: usersWithSharedGoals,
        })
    );
};
