import Knock from '@knocklabs/node';

const knockClient = process.env.KNOCK_API_KEY 
  ? new Knock({
      apiKey: process.env.KNOCK_API_KEY,
    })
  : null;

/**
 * Identify or update a user in Knock
 * @param {string} userId - The unique user ID (e.g., Clerk user ID)
 * @param {object} userData - User data to send to Knock
 */
export async function identifyKnockUser(userId: string, userData: Record<string, any>) {
  if (!knockClient) {
    console.warn('Knock client not initialized - skipping user identification');
    return;
  }
  try {
    await knockClient.users.update(userId, userData);
  } catch (err) {
    console.error('Knock identify error:', err);
  }
}

/**
 * Trigger a Knock workflow for a user
 * @param {string} workflowKey - The Knock workflow key
 * @param {string[]} recipients - Array of user IDs
 * @param {object} data - Data to pass to the workflow
 */
export async function triggerKnockWorkflow(workflowKey: string, recipients: string[], data: Record<string, any>) {
  if (!knockClient) {
    console.warn('Knock client not initialized - skipping workflow trigger');
    return;
  }
  try {
    await knockClient.workflows.trigger(workflowKey, {
      recipients,
      data,
    });
  } catch (err) {
    console.error('Knock workflow trigger error:', err);
  }
} 