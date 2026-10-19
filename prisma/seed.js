const prisma = require("../config/db");

const main = async () => {
  const users = await prisma.user.createMany({
    data: [
      { name: "Bob", email: "bob@prisma.io" },
      { name: "Bobo", email: "bob@prisma.io" },
      { name: "Yewande", email: "yewande@prisma.io" },
      { name: "Angelique", email: "angelique@prisma.io" },
    ],
    skipDuplicates: true
  });

  const posts = await prisma.post.createMany({
    data: [
        {title: "First Post", content: "Post is good", published: true},
        {title: "Second Post", content: "Post is better", published: true},
        {title: "Third Post", content: "Post is best", published: true},
        {title: "Fourth Post", content: "Post is poor", published: true},
        {title: "Fifth Post", content: "Post is worst", published: true},
    ],
    skipDuplicates: true
  })
};

main()
    .then(async () => {
        await prisma.$disconnect();
    })
