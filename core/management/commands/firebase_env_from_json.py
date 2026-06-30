import json

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Print FIREBASE_* .env lines from a Firebase service account JSON file."

    def add_arguments(self, parser):
        parser.add_argument(
            "json_path",
            type=str,
            help="Path to the downloaded Firebase service account JSON file",
        )

    def handle(self, *args, **options):
        json_path = options["json_path"]

        try:
            with open(json_path, encoding="utf-8") as handle:
                data = json.load(handle)
        except FileNotFoundError as exc:
            raise CommandError(f"File not found: {json_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON file: {json_path}") from exc

        required = ("project_id", "client_email", "private_key")
        missing = [field for field in required if not data.get(field)]
        if missing:
            raise CommandError(f"Missing required JSON fields: {', '.join(missing)}")

        private_key = data["private_key"].replace("\n", "\\n")

        lines = [
            f"FIREBASE_PROJECT_ID={data['project_id']}",
            f"FIREBASE_CLIENT_EMAIL={data['client_email']}",
            f'FIREBASE_PRIVATE_KEY="{private_key}"',
        ]

        if data.get("private_key_id"):
            lines.append(f"FIREBASE_PRIVATE_KEY_ID={data['private_key_id']}")
        if data.get("client_id"):
            lines.append(f"FIREBASE_CLIENT_ID={data['client_id']}")
        if data.get("client_x509_cert_url"):
            lines.append(f"FIREBASE_CLIENT_X509_CERT_URL={data['client_x509_cert_url']}")

        self.stdout.write("\n".join(lines))
        self.stdout.write(
            "\n\nCopy the lines above into your .env file, then delete the JSON file from the repo."
        )
