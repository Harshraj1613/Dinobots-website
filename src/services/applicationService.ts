// Real submission flow for the Join Us application form — posts to the
// public POST /api/join-requests endpoint (no auth required) and stores the
// application in MongoDB. Same public shape as before (ApplicationForm only
// depends on this module's exports), so the form component needed no
// changes when this switched from a mock to the real backend.
import { joinRequestService } from './joinRequestService'

export interface ApplicationData {
  fullName: string
  email: string
  year: string
  branch: string
  interest: string
  reason: string
}

export interface SubmitResult {
  success: boolean
}

export const applicationService = {
  async submit(data: ApplicationData): Promise<SubmitResult> {
    const result = await joinRequestService.submit({
      fullName: data.fullName,
      email: data.email,
      year: data.year,
      branch: data.branch,
      areaOfInterest: data.interest,
      reason: data.reason,
    })
    return { success: result.success }
  },
}
