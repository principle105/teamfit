import type { ObjectId } from "mongodb";

export interface Reply {
    userId: string;
    content: any;
    date: number;
}

export interface Post extends Reply {
    replies: Reply[];
    badges: string[];
}

export interface User {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    description: string | null;
    image: string;
    goals: { [key: string]: number };
    friend: string | null;
    surveyCompleted: boolean;
    posts: Post[];
    points: number;
    badges: string[];
}

export interface DatabaseUser extends User {
    _id: ObjectId;
}

export interface Friend
    extends Omit<User, "email" | "friend" | "surveyCompleted"> {
    commonGoals: string[];
}
