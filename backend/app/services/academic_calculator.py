def calculate_internal_average(internal_1: float, internal_2: float, internal_3: float) -> float:
    """Calculates internal assessment average out of 50"""
    marks = [internal_1, internal_2, internal_3]
    return round(sum(marks) / 3.0, 2)

def calculate_assignment_average(assignment_1: float, assignment_2: float) -> float:
    """Calculates assignment average out of 10"""
    return round((assignment_1 + assignment_2) / 2.0, 2)

def calculate_sgpa(semester_marks: list) -> float:
    """
    Calculates Semester Grade Point Average (SGPA) based on credits and grade points.
    Formula: SGPA = SUM(Credits * Points) / SUM(Credits)
    """
    if not semester_marks:
        return 0.0

    grade_points_map = {
        'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'RA': 0, 'SA': 0, 'W': 0, 'U': 0
    }

    total_credit_points = 0.0
    total_credits = 0.0

    for mark in semester_marks:
        credits = float(getattr(mark, 'credits', 3) or 3)
        grade = str(getattr(mark, 'grade', 'O')).strip().upper()
        points = grade_points_map.get(grade, 10)
        
        total_credit_points += credits * points
        total_credits += credits

    if total_credits == 0:
        return 0.0

    return round(total_credit_points / total_credits, 2)

def calculate_cgpa(completed_semesters_marks: list) -> float:
    """
    Calculates Cumulative Grade Point Average (CGPA) using credit-weighted academic policy.
    Formula: CGPA = SUM(Total Credit Points across Completed Semesters) / SUM(Total Credits across Completed Semesters)
    Future/Uncompleted semesters are NEVER treated as zero and NEVER included.
    """
    if not completed_semesters_marks:
        return 0.0

    grade_points_map = {
        'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'RA': 0, 'SA': 0, 'W': 0, 'U': 0
    }

    total_credit_points = 0.0
    total_credits = 0.0

    for mark in completed_semesters_marks:
        credits = float(getattr(mark, 'credits', 3) or 3)
        grade = str(getattr(mark, 'grade', 'O')).strip().upper()
        points = grade_points_map.get(grade, 10)

        total_credit_points += credits * points
        total_credits += credits

    if total_credits == 0:
        return 0.0

    return round(total_credit_points / total_credits, 2)

def calculate_attendance_percentage(present_count: int, total_count: int, od_count: int = 0) -> float:
    """
    Calculates attendance percentage considering Present + OD hours.
    Formula: Attendance % = ((Present + OD) / Total) * 100
    """
    if total_count == 0:
        return 100.0

    effective_present = present_count + od_count
    percentage = (effective_present / total_count) * 100.0
    return round(min(percentage, 100.0), 1)
