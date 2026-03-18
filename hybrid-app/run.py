from app import create_app

app = create_app()

if __name__ == '__main__':
    import os
    port = int(os.getenv('FLASK_PORT', 5000))
    print(f"\n🚀  Hybrid Station running at  http://localhost:{port}\n")
    app.run(debug=True, port=port)
