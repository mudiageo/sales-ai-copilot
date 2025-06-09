import type { PageServerLoad, Actions } from "./$types.js";
import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { 
  profileSchema, 
  notificationSchema, 
  teamSchema, 
  aiConfigSchema, 
  securitySchema 
} from "./schemas";

export const load: PageServerLoad = async () => {
  return {
    profileForm: await superValidate(zod(profileSchema)),
    notificationForm: await superValidate(zod(notificationSchema)),
    teamForm: await superValidate(zod(teamSchema)),
    aiConfigForm: await superValidate(zod(aiConfigSchema)),
    securityForm: await superValidate(zod(securitySchema)),
  };
};

export const actions: Actions = {
  updateProfile: async (event) => {
    const form = await superValidate(event, zod(profileSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    // Handle profile update logic here
    return { form };
  },

  updateNotifications: async (event) => {
    const form = await superValidate(event, zod(notificationSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    // Handle notification update logic here
    return { form };
  },

  updateTeam: async (event) => {
    const form = await superValidate(event, zod(teamSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    // Handle team update logic here
    return { form };
  },

  updateAiConfig: async (event) => {
    const form = await superValidate(event, zod(aiConfigSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    // Handle AI config update logic here
    return { form };
  },

  updateSecurity: async (event) => {
    const form = await superValidate(event, zod(securitySchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    // Handle security update logic here
    return { form };
  }
};