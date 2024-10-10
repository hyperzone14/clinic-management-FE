export interface Routes {
    id:number;
    path: string;
    location: string;
};

export const pageRoutes: Routes[] = [
    {
        id:1,
        path: "/",
        location: "Home"
    },
    {
        id:2,
        path: "/feedback",
        location: "Feedback"
    },
    {
        id:3,
        path: "/search",
        location: "Search"
    },
    {
        id:4,
        path: "/schedule",
        location: "Schedule"
    },
    {
        id:5,
        path: "/rollcall",
        location: "Rollcall"
    },

]