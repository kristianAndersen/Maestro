#!/usr/bin/env python3

import argparse
import json
from pathlib import Path
import re
import shutil
import sys

def title_case_skill_name(skill_name):
    """Convert hyphenated skill name to Title Case for display."""
    return ' '.join(word.capitalize() for word in skill_name.split('-'))

def generate_skill(skill_name, skill_description, skill_capabilities, resource_list):
    """
    Generates a new skill directory and files based on provided information.
    Updates skill-rules.json with the new skill entry.
    """
    
    # Define paths
    skills_root = Path(__file__).parent.parent.parent # .claude/skills/
    skill_dir = skills_root / skill_name
    
    wizard_assets_dir = Path(__file__).parent.parent / "assets" # .claude/skills/skill-wizard/assets
    
    skill_md_template_path = wizard_assets_dir / "skill_template.md"
    rules_template_path = wizard_assets_dir / "rules_template.json"
    
    skill_rules_path = skills_root / "skill-rules.json"

    # 1. Validate skill name
    if not re.fullmatch(r'^[a-z0-9-]+$', skill_name):
        print(f"❌ Error: Skill name '{skill_name}' must be hyphen-case (lowercase letters, digits, and hyphens only).")
        return False
    if skill_dir.exists():
        print(f"❌ Error: Skill directory '{skill_dir}' already exists.")
        return False

    # 2. Create skill directory structure
    try:
        skill_dir.mkdir(parents=True, exist_ok=False)
        (skill_dir / "scripts").mkdir()
        (skill_dir / "references").mkdir()
        (skill_dir / "assets").mkdir()
        print(f"✅ Created skill directory: {skill_dir}")
    except Exception as e:
        print(f"❌ Error creating skill directory structure: {e}")
        return False

    # 3. Generate SKILL.md
    try:
        skill_title = title_case_skill_name(skill_name)
        skill_md_template_content = skill_md_template_path.read_text()
        
        skill_md_content = skill_md_template_content.format(
            skill_name=skill_name,
            skill_description=skill_description,
            skill_title=skill_title
        )
        (skill_dir / "SKILL.md").write_text(skill_md_content)
        print(f"✅ Generated {skill_name}/SKILL.md")
    except Exception as e:
        print(f"❌ Error generating SKILL.md: {e}")
        return False

    # 4. Create placeholder resource files
    if resource_list:
        for resource_path_str in resource_list.split(','):
            resource_path_str = resource_path_str.strip()
            if not resource_path_str:
                continue
            
            resource_path = skill_dir / resource_path_str
            try:
                resource_path.parent.mkdir(parents=True, exist_ok=True)
                resource_path.touch()
                print(f"✅ Created placeholder resource: {resource_path}")
            except Exception as e:
                print(f"❌ Error creating resource file {resource_path}: {e}")
                # Continue to create other resources even if one fails
    else:
        print("ℹ️ No specific resources requested.")

    # 5. Update skill-rules.json
    try:
        skill_rules_content = json.loads(skill_rules_path.read_text())
        rules_template_content = json.loads(rules_template_path.read_text())
        
        # Prepare keywords and intent patterns from description and capabilities
        # For now, we'll use description words as keywords and a generic intent pattern
        # This can be refined by the user later.
        keywords = list(set(word.lower() for word in re.findall(r'\b\w+\b', skill_description) if len(word) > 2))
        if skill_capabilities:
            keywords.extend([cap.strip().lower() for cap in skill_capabilities.split(',')])
        keywords = sorted(list(set(keywords))) # Remove duplicates and sort

        # Create a generic intent pattern based on description
        # This is a placeholder and should be refined manually by the user
        intent_pattern_base = re.sub(r'[^\w\s]', '', skill_description).lower()
        intent_pattern_base = '.*'.join(intent_pattern_base.split()[:5]) + '.*' if intent_pattern_base else '.*'
        intent_patterns = [f"({intent_pattern_base})"]
        
        new_skill_entry = rules_template_content["{skill_name}"]
        new_skill_entry["description"] = skill_description
        new_skill_entry["promptTriggers"]["keywords"] = keywords
        new_skill_entry["promptTriggers"]["intentPatterns"] = intent_patterns
        
        skill_rules_content["skills"][skill_name] = new_skill_entry
        
        skill_rules_path.write_text(json.dumps(skill_rules_content, indent=2))
        print(f"✅ Added '{skill_name}' to skill-rules.json")
    except Exception as e:
        print(f"❌ Error updating skill-rules.json: {e}")
        return False

    print(f"\n🎉 Skill '{skill_name}' generated successfully!")
    print(f"Next steps:")
    print(f"1. Open '{skill_dir}/SKILL.md' and fill in the TODO sections with your skill's logic.")
    print(f"2. Refine the 'promptTriggers' in '{skill_rules_path}' for better auto-activation.")
    print(f"3. Implement the actual logic in your skill's scripts/ or directly in SKILL.md.")
    
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a new Maestro skill.")
    parser.add_argument("--name", required=True, help="Name of the skill (hyphen-case).")
    parser.add_argument("--description", required=True, help="One-sentence description of the skill.")
    parser.add_argument("--capabilities", default="", help="Comma-separated list of skill capabilities.")
    parser.add_argument("--resources", default="", help="Comma-separated list of resource paths (e.g., scripts/my_script.py, references/my_doc.md).")
    
    args = parser.parse_args()
    
    if generate_skill(args.name, args.description, args.capabilities, args.resources):
        sys.exit(0)
    else:
        sys.exit(1)
