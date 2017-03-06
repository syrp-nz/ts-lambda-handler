/**
 * Represent a minimalist user object.
 */
export interface UserInterface {

    /** Unique identifier for the user */
    id:string;

    /**
     * Whatever the current user is anonymous.
     */
    anonymous:boolean;

    /**
     * Human readable representation for that user
     */
    name: string;

    /**
     * Email for this user
     */
    email?: string;

    first_name?: string;
    last_name?: string;
    scopes?: string;

}
