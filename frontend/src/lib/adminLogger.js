import api from './axios';

class AdminLogger {
  static async logAction(actionType, details = {}) {
    try {
      await api.post('/admin/log-action', {
        actionType,
        details
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw error - logging failures shouldn't break the app
    }
  }

  // Convenience methods for common actions
  static logBatchSelection(batchName) {
    return this.logAction('batch_selection', {
      batchName,
      action: `Selected batch: ${batchName}`
    });
  }

  static logLeaderboardView(batchName) {
    return this.logAction('view_leaderboard', {
      batchName,
      action: `Viewed leaderboard for batch: ${batchName}`
    });
  }

  static logStudentSearch(regNo) {
    return this.logAction('search_student', {
      studentRegNo: regNo,
      action: `Searched for student: ${regNo}`
    });
  }

  static logPageNavigation(pageName, batchName = null) {
    const actionMap = {
      'leaderboard': 'view_leaderboard',
      'markattendance': 'mark_attendance',
      'viewattendance': 'view_attendance',
      'markentry': 'update_marks'
    };

    const action = actionMap[pageName] || 'page_visit';
    const details = {
      action: `Navigated to ${pageName}`,
      metadata: { page: pageName }
    };

    if (batchName) {
      details.batchName = batchName;
      details.action += ` for batch: ${batchName}`;
    }

    return this.logAction(action, details);
  }
}

export default AdminLogger;