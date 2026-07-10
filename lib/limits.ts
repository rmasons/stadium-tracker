// Central copies of the size caps also enforced in firestore.rules. Rules
// can't import JS, so these constants only drive the UI (disabling chips,
// client-side validation messages); the source of truth for enforcement is
// still firestore.rules. Keep both sides in sync by hand if either changes.

/**
 * Max buddyIds on a single visit doc. Mirrors the
 * `request.resource.data.buddyIds.size() <= 25` cap in both the visits
 * `create` and `update` rules, and the unrolled `allValidBuddyIds` validator
 * (indices 0-24) in firestore.rules.
 */
export const MAX_VISIT_BUDDIES = 25;

/**
 * Max friendUids on a single visit doc. Mirrors the
 * `request.resource.data.friendUids.size() <= 10` cap in both the visits
 * `create` and `update` rules, and the unrolled `allAcceptedFriends`
 * validator (indices 0-9) in firestore.rules.
 */
export const MAX_VISIT_FRIENDS = 10;

/**
 * Max length of a buddy's name. Mirrors the
 * `request.resource.data.name.size() <= 50` cap in the
 * `buddies/{buddyId}` create/update rule in firestore.rules.
 */
export const MAX_BUDDY_NAME_LENGTH = 50;
