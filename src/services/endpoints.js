

export const endpoints = {
    // user
    get_user : "/api/auth/get-user-data/",

    // Auth
    create: "/api/auth/create/",
    login: "/api/auth/login/",
    refresh: "/api/auth/refresh-token/",
    logout: "/api/auth/logout/",
    delete_account: "/api/auth/delete-account/",

    // banners
    banners: "/api/banner/get-banners/",

    // socials
    socials: "/api/social/get-socials/",

    //busy dates
    busyDates: "/api/busydate/get-busy-dates/",

    // assignments
    create_assignment: "/api/assignment/create-assignment/",
    get_infinite_assignments: "/api/assignment/get-infinite-assignments/",
    get_assignment_progress: "/api/assignmentprogress/get-assignment-progress/",
    unsubmit_assignment: "/api/assignment/unsubmit-assignment/",
    changes_request: "/api/assignment/changes-request/",

    //notifications
    get_user_notifications: "/api/notification/get-user-notifications/",
    post_fcm_token: "/api/notification/save-notification-token/",

    // payment
    submit_payment: "/api/payment/submit-payment/"

}