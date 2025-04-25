from setuptools import setup, find_packages

setup(
    name="ai-search-tool-backend",
    version="1.0.0",
    description="Backend for AI-Powered Search Tool",
    author="Your Name",
    author_email="your.email@example.com",
    packages=find_packages(),
    install_requires=[
        "Django==5.1.6",
        "djangorestframework==3.14.0",
        "django-cors-headers==4.3.1",
        "psycopg2-binary==2.9.9",
        "python-dotenv==1.0.0",
        "requests==2.31.0",
        "whitenoise==6.6.0",
        "gunicorn==21.2.0",
        "django-environ==0.11.2",
    ],
    python_requires=">=3.11.0",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.11",
        "Framework :: Django",
        "Framework :: Django :: 5.1",
    ],
    include_package_data=True,
    zip_safe=False,
) 